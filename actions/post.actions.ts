"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// Esta função agora aceita FormData para poder receber ficheiros
export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Acesso negado." };
  }

  // Extrai os dados do FormData
  const title = formData.get("title") as string;
  const content = formData.get("content") as string; // Legenda para imagens
  const type = formData.get("type") as "TEXT" | "IMAGE";
  const file = formData.get("file") as File | null;

  if (type === "TEXT" && !content) {
    return { error: "O conteúdo não pode estar vazio." };
  }

  let imageUrl: string | undefined;

  // Se for uma postagem de imagem, faz o upload
  if (type === "IMAGE" && file) {
    if (file.size === 0) return { error: "Ficheiro de imagem é obrigatório." };

    // Gera um nome de ficheiro único para evitar conflitos
    const fileName = `${randomUUID()}-${file.name}`;

    // Faz o upload para o bucket 'imagens-posts' no Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("imagens-posts")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Erro no upload para o Supabase:", uploadError);
      return { error: "Não foi possível fazer o upload da imagem." };
    }

    // Obtém a URL pública da imagem que acabámos de enviar
    const { data: publicUrlData } = supabase.storage
      .from("imagens-posts")
      .getPublicUrl(uploadData.path);

    imageUrl = publicUrlData.publicUrl;
  } else if (type === "IMAGE" && !file) {
    return { error: "Um ficheiro de imagem é obrigatório." };
  }

  try {
    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        type: type,
        imageUrl: imageUrl, // Guarda o link da imagem no banco de dados
        authorId: session.user.id,
      },
    });
    // Invalida o cache do dashboard para que a nova postagem apareça imediatamente
    revalidatePath("/dashboard");
    return { success: "Postagem criada com sucesso!", post };
  } catch (error) {
    console.error("Erro ao criar postagem:", error);
    return { error: "Ocorreu um erro ao salvar a postagem." };
  }
}

/**
 * Lista todas as postagens do banco de dados, da mais recente para a mais antiga.
 */
export async function listPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { fullName: true, image: true, id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { posts };
  } catch (error) {
    console.error("Erro ao buscar postagens:", error);
    return { error: "Não foi possível carregar as postagens." };
  }
}

/**
 * Deleta uma postagem.
 * Apenas o autor da postagem pode deletá-la.
 */
export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Acesso negado." };
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post || post.authorId !== session.user.id) {
    return { error: "Você não tem permissão para deletar esta postagem." };
  }
  try {
    // Adicionar lógica para deletar a imagem do Supabase Storage aqui no futuro
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/dashboard");
    return { success: "Postagem deletada com sucesso." };
  } catch (error) {
    return { error: "Ocorreu um erro ao deletar a postagem." };
  }
}

/**
 * Atualiza uma postagem existente.
 * Apenas o autor da postagem pode editá-la.
 */
export async function updatePost(postId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Acesso negado." };
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post || post.authorId !== session.user.id) {
    return { error: "Você não tem permissão para editar esta postagem." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as "TEXT" | "IMAGE";

  // A lógica de upload de uma *nova* imagem na edição pode ser adicionada aqui no futuro
  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: content,
        type: type,
      },
    });
    revalidatePath("/dashboard");
    return { success: "Postagem atualizada com sucesso!", post: updatedPost };
  } catch (error) {
    return { error: "Ocorreu um erro ao salvar as alterações." };
  }
}

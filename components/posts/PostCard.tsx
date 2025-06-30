"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { MessageSquare, Heart, MoreVertical, Trash2, Edit } from "lucide-react";
import { Prisma } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePost } from "@/actions/post.actions";
import PostEditorModal from "@/components/modals/PostEditorModal";
import { DialogTrigger } from "@radix-ui/react-dialog";

type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { fullName: true; image: true; id: true } } };
}>;

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const postDate = new Date(post.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isAuthor = post.author.id === currentUserId;

  const handleDelete = async () => {
    const result = await deletePost(post.id);
    if (result.error) {
      alert(`Erro: ${result.error}`);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="bg-[#1F2937] border-gray-700/50 text-white">
        <CardHeader className="flex flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Image
              src={post.author.image || "/logo.jpeg"}
              alt={`Avatar de ${post.author.fullName || "Utilizador"}`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-semibold">{post.author.fullName}</span>
              <span className="text-xs text-gray-400">{postDate}</span>
            </div>
          </div>

          {isAuthor && (
            <PostEditorModal mode="edit" post={post}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-gray-700">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      className="cursor-pointer hover:!bg-gray-700"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-500 hover:!bg-red-500/20 hover:!text-red-400"
                    onSelect={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Deletar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PostEditorModal>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-2">
          {post.title && (
            <h3 className="text-xl font-bold mb-2 text-blue-400">
              {post.title}
            </h3>
          )}

          {/* CORREÇÃO: Usamos as classes 'prose' do Tailwind para formatar o conteúdo do Markdown */}
          <article className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </article>
        </CardContent>

        <CardFooter className="p-4 flex items-center gap-4 border-t border-gray-700/50">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white">
            <Heart className="h-5 w-5" />
            <span>Curtir</span>
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white">
            <MessageSquare className="h-5 w-5" />
            <span>Comentar</span>
          </button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. Isto irá deletar permanentemente
              a sua postagem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Image as ImageIcon } from "lucide-react";
import { createPost, updatePost } from "@/actions/post.actions";
import { Prisma } from "@prisma/client";

type Post = Prisma.PostGetPayload<{}>;

interface PostEditorModalProps {
  mode: "create" | "edit";
  post?: Post;
  children: React.ReactNode;
}

export default function PostEditorModal({
  mode,
  post,
  children,
}: PostEditorModalProps) {
  const [open, setOpen] = useState(false);
  const [postType, setPostType] = useState<"TEXT" | "IMAGE">("TEXT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Usado para texto ou legenda
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (mode === "edit" && post && open) {
      setTitle(post.title || "");
      setContent(post.content);
      setPostType(post.type as "TEXT" | "IMAGE");
    } else if (mode === "create") {
      setTitle("");
      setContent("");
      setPostType("TEXT");
      setSelectedFile(null);
    }
  }, [open, mode, post]);

  const handleSubmit = async () => {
    // 1. Cria um objeto FormData para enviar os dados
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("type", postType);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    // 2. Chama a ação de backend apropriada com o FormData
    const result =
      mode === "edit" && post
        ? await updatePost(post.id, formData)
        : await createPost(formData);

    if (result.error) {
      alert(`Erro: ${result.error}`);
    } else {
      alert(result.success);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Postagem" : "Nova Postagem"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Altere os dados da sua postagem."
              : "Escolha o tipo de postagem e compartilhe."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={postType}
          onValueChange={(value) => setPostType(value as "TEXT" | "IMAGE")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="TEXT" className="gap-2">
              <FileText className="h-4 w-4" />
              Aviso
            </TabsTrigger>
            <TabsTrigger value="IMAGE" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="TEXT" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título (Opcional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do seu aviso"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Aviso</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva a sua mensagem aqui."
                rows={6}
              />
            </div>
          </TabsContent>

          <TabsContent value="IMAGE" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="picture">Ficheiro da Imagem</Label>
              {/* O input de ficheiro agora guarda o ficheiro no estado */}
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Legenda</Label>
              <Textarea
                id="caption"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva uma legenda para a imagem."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "edit" ? "Salvar Alterações" : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

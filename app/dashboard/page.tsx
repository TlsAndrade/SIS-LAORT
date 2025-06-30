import { auth } from "@/auth";
import { listPosts } from "@/actions/post.actions";
// CORREÇÃO: Importa o PostEditorModal que estava em falta
import PostEditorModal from "@/components/modals/PostEditorModal";
import PostCard from "@/components/posts/PostCard";
import { FileText, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const { posts, error } = await listPosts();

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Acompanhe as atividades da liga</p>
        </div>
        {isAdmin && (
          <PostEditorModal mode="create">
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar Postagem
              </Button>
            </DialogTrigger>
          </PostEditorModal>
        )}
      </div>

      {/* Barra de Notificação */}
      <div className="mb-8 flex items-center gap-3 rounded-lg bg-[#1F2937] p-4">
        <Users className="h-5 w-5 text-gray-400" />
        <p className="text-sm text-gray-400">
          Você pode visualizar todas as atualizações da diretoria
        </p>
      </div>

      {/* Feed de Postagens */}
      <div className="space-y-6">
        {error && <p className="text-red-500">{error}</p>}

        {posts && posts.length > 0 ? (
          // Se houver postagens, mapeia e exibe cada uma
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={session?.user?.id ?? ""}
            />
          ))
        ) : (
          // Se não houver postagens, exibe a mensagem padrão
          <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-[#1F2937]/50 border border-gray-700/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/70 mb-4">
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Nenhuma postagem ainda
            </h3>
            <p className="text-sm text-gray-400">
              {isAdmin
                ? "Crie a primeira postagem para a liga!"
                : "Aguarde as primeiras atualizações da diretoria"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Globe, Users as UsersIcon, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Post } from "@/types";
import { relTime, fmtCount } from "@/lib/format";
import { postService } from "@/services/mockApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PRIVACY = {
  public: { Icon: Globe, label: "Public" },
  followers: { Icon: UsersIcon, label: "Followers" },
  private: { Icon: Lock, label: "Only me" },
};

export function PostCard({ post }: { post: Post }) {
  const author = postService.getAuthor(post.authorId);
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = useState<{ liked: boolean; likes: number } | null>(null);

  const likeMut = useMutation({
    mutationFn: () => postService.toggleLike(post.id),
    onMutate: () => {
      setOptimistic({
        liked: !post.liked,
        likes: post.likes + (post.liked ? -1 : 1),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      setOptimistic(null);
    },
  });

  const saveMut = useMutation({
    mutationFn: () => postService.toggleSave(post.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const liked = optimistic?.liked ?? post.liked;
  const likes = optimistic?.likes ?? post.likes;
  const Priv = PRIVACY[post.privacy];

  if (!author) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="surface-card overflow-hidden"
    >
      <header className="flex items-start gap-3 p-4">
        <Link to="/profile/$id" params={{ id: author.id }}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/profile/$id" params={{ id: author.id }} className="font-semibold text-sm hover:underline truncate">
              {author.name}
            </Link>
            {author.isVerified && (
              <span className="text-primary text-xs" aria-label="Verified">✓</span>
            )}
            <span className="text-muted-foreground text-xs">@{author.handle}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span>{relTime(post.createdAt)}</span>
            <span>·</span>
            <Priv.Icon className="h-3 w-3" />
            <span>{Priv.label}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </header>

      {post.text && (
        <div className="px-4 pb-3 text-[15px] leading-relaxed whitespace-pre-wrap">{post.text}</div>
      )}

      {post.image && (
        <div className="border-y bg-muted/40">
          <img src={post.image} alt="" loading="lazy" className="w-full max-h-[520px] object-cover" />
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{fmtCount(likes)} reactions</span>
        <span>{fmtCount(post.comments)} comments · {fmtCount(post.shares)} shares</span>
      </div>

      <div className="px-2 pb-2 grid grid-cols-4 gap-1 border-t pt-1">
        <Action
          onClick={() => likeMut.mutate()}
          active={liked}
          activeClass="text-rose-500"
          icon={<Heart className={cn("h-[18px] w-[18px]", liked && "fill-current")} />}
          label="Like"
        />
        <Action icon={<MessageCircle className="h-[18px] w-[18px]" />} label="Comment" />
        <Action icon={<Share2 className="h-[18px] w-[18px]" />} label="Share" />
        <Action
          onClick={() => saveMut.mutate()}
          active={post.saved}
          activeClass="text-primary"
          icon={<Bookmark className={cn("h-[18px] w-[18px]", post.saved && "fill-current")} />}
          label="Save"
        />
      </div>
    </motion.article>
  );
}

function Action({
  icon, label, onClick, active, activeClass,
}: { icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean; activeClass?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-foreground",
        active && activeClass,
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

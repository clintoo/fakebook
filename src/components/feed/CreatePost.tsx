import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image, Smile, MapPin, Globe } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/mockApi";
import { useState } from "react";
import { toast } from "sonner";

export function CreatePost() {
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => postService.createPost({ text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      setText("");
      toast.success("Post shared");
    },
  });

  if (!user) return null;

  return (
    <div className="surface-card p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What's on your mind, ${user.name.split(" ")[0]}?`}
            rows={2}
            className="w-full resize-none bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 h-8">
                <Image className="h-4 w-4" /> <span className="hidden sm:inline">Photo</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 h-8">
                <Smile className="h-4 w-4" /> <span className="hidden sm:inline">Feeling</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 h-8">
                <MapPin className="h-4 w-4" /> <span className="hidden sm:inline">Location</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 h-8">
                <Globe className="h-4 w-4" /> <span className="hidden sm:inline">Public</span>
              </Button>
            </div>
            <Button
              size="sm"
              disabled={!text.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

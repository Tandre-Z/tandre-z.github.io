"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "./ui/dialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";

const PostCard: React.FC<{ group: any; groupName: string }> = ({ group, groupName }) => {
    const [open, setOpen] = useState(false);

    return (
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl font-semibold">{groupName}</CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(!open)}
                    aria-label={`查看${group.groupName}的全部内容`}
                >
                    <ChevronDown className={`h-4 w-4 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {group.posts.slice(0, 3).map((post: any) => (
                    <div key={post.title} className="flex justify-between items-center py-2">
                        <a
                            href={post.link}
                            className="text-red-500 hover:text-red-600"
                            tabIndex={0}
                            aria-label={`查看文章：${post.title}`}
                        >
                            {post.title}
                        </a>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
                    </div>
                ))}
            </CardContent>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl h-[60vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{group.groupName}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[calc(60vh-80px)] pr-4 rounded-md">
                        <div className="space-y-4">
                            {group.posts.map((post: any) => (
                                <div key={post.id} className="flex justify-between items-center py-2">
                                    <a
                                        href={post.link}
                                        className="text-red-500 hover:text-red-600"
                                        tabIndex={0}
                                        aria-label={`查看文章：${post.title}`}
                                    >
                                        {post.title}
                                    </a>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default PostCard;
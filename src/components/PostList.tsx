"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import posts from '../data/posts.json'

interface PostListProps {
    className?: string;
    dictionary: { [key: string]: any }; // 使用索引签名
}

const PostList: React.FC<PostListProps> = ({ className, dictionary }) => {

    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const key2dict: { [key: string]: string } = {
        "Unity相关 | UnityRelated": dictionary.home.home_blog.unity_related,
        "游戏设计 | GameDesign": dictionary.home.home_blog.game_design,
        "其它技术 | OtherTech": dictionary.home.home_blog.other_tech,
        "杂谈/写作 | Chat&Write": dictionary.home.home_blog.chat_write
    }

    const handleOpen = (groupName: string) => {
        setOpenGroup(groupName);
    };

    const handleClose = () => {
        setOpenGroup(null);
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className || ''}`}>
            {posts.map((group) => (
                <Card key={group.groupName} className=" hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out transform">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-xl font-semibold">{key2dict[group.groupName]}</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpen(group.groupName)}
                            aria-label={`查看${group.groupName}的全部内容`}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {group.posts.slice(0, 3).map((post) => (
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

                    <Dialog open={openGroup === group.groupName} onOpenChange={handleClose}>
                        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-[734px] max-h-[85vh] aspect-[1/1.2] flex flex-col [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0 p-4 sm:p-6 overflow-hidden">
                            <DialogHeader className="pb-2">
                                <DialogTitle className="text-xl">{key2dict[group.groupName]}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 pr-4 rounded-md">
                                <div className="space-y-4">
                                    {group.posts.map((post) => (
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
            ))}
        </div>
    )
}

export default PostList;

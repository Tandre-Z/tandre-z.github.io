import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
    title: "关于作者",
    description: "Tandre的个人简历",
    keywords: ["开发者简介", "教育背景", "项目经验", "技术栈"],
    openGraph: {
        title: "关于Tandre",
        description: "Tandre的个人简介、技术背景与项目经验等",
        images: "/img/icon.png",
    },
    alternates: {
        canonical: "/about",
    },
};

export default async function AboutPage({
    params: { lang },
}: {
    params: { lang: string }
}) {
    const dictionaries = await getDictionary(lang);
    return (
        <div className="mx-auto">

            <div className="my-4">
                <Link href={`/${lang}`} className="text-red-500 hover:text-red-600 hover:underline">
                    <strong>{dictionaries.about.back_to_home}</strong>
                </Link>
            </div>

            <h1 className="text-2xl my-8 font-bold text-center">{dictionaries.about.title}</h1>

            {/* 引言区块 */}
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                    Rookie's road to a better rookie!<br />
                </AlertDescription>
            </Alert>

            {/* About Me */}
            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>
                        {dictionaries.about.title}
                    </CardTitle>
                    <CardDescription>
                        {dictionaries.about.description}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* 教育经历 */}
            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>
                        {dictionaries.about.education.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {
                        dictionaries.about.education.school.map((school) => (
                            <div key={school.name}>
                                <div className="flex justify-between items-center">
                                    <strong>{school.name}</strong>
                                    <span>{school.time}</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {
                                        school.honors.map((honor: string) => (
                                            <Badge key={honor} variant="outline" className="px-2 py-1 text-sm">
                                                {honor}
                                            </Badge>
                                        ))
                                    }
                                </div>
                            </div>
                        ))
                    }
                </CardContent>
            </Card>

            {/* 荣誉奖项 */}
            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>
                        {dictionaries.about.honor.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        {
                            dictionaries.about.honor.honors.map((honor) => (
                                <TimeItem key={honor.title} title={honor.title} time={honor.time} />
                            ))
                        }
                    </div>
                </CardContent>
            </Card>

            {/* 技能/证书/其他 */}
            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>{dictionaries.about.Other.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {
                            dictionaries.about.Other.skills.map((skill: string) => (
                                <Badge key={skill} variant="outline" className="px-3 py-1">
                                    {skill}
                                </Badge>
                            ))
                        }
                    </div>

                    <ul className="mt-4 space-y-2">
                        {
                            dictionaries.about.Other.other.map((other: { title: string; content: string }) => (
                                <ListItem key={other.title} title={other.title} content={other.content} />
                            ))
                        }
                    </ul>
                </CardContent>
            </Card>

            {/* 工作经历 */}
            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>{dictionaries.about.work_experience.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {
                        dictionaries.about.work_experience.experiences.map((experience) => (
                            <TimelineItem
                                key={experience.title}
                                title={experience.title}
                                time={experience.time}
                                projects={experience.projects}
                            />
                        ))
                    }
                </CardContent>
            </Card>

            {/* 最后更新时间 */}
            <div className="my-16 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p className="tracking-wide">{dictionaries.about.last_updated}2024/12/27</p>
                <p className="font-mono text-primary dark:text-primary-dark">TandreZ</p>
            </div>
        </div >
    );
}

function TimelineItem({ title, time, badges = [], projects = [] }: TimelineItemProps) {
    return (
        <div className="relative pl-6 border-l-2 border-red-500 space-y-4">
            <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] top-2" />
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{title}</h3>
                <span className="text-sm text-gray-500">{time}</span>
            </div>
            {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                        <Badge key={badge} variant="outline" className="px-2 py-1 text-sm">
                            {badge}
                        </Badge>
                    ))}
                </div>
            )}
            {projects.map((project, index) => (
                <Alert key={index} className="hover:shadow-sm">
                    <AlertTitle className="font-bold">{project.title}</AlertTitle>
                    <AlertDescription className="p-4">
                        {project.content.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </AlertDescription>
                </Alert>
            ))}
        </div>
    );
}

function TimeItem({ title, time }: { title: string; time: string }) {
    return (
        <div className="flex justify-between items-center rounded">
            <span>{title}</span>
            <span className="text-sm text-gray-500">{time}</span>
        </div>
    );
}

function ListItem({ title, content }: { title: string; content: string }) {
    return (
        <li className="flex gap-2">
            <strong>{title}</strong>
            <span>{content}</span>
        </li>
    );
}

type TimelineItemProps = {
    title: string;
    time: string;
    badges?: string[];
    projects?: Array<{
        title: string;
        content: string;
    }>;
};

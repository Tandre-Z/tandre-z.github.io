import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import Footer from "@/components/Footer";

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

            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>
                        {dictionaries.about.education}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <strong>广西科技大学 - 软件工程（虚拟现实技术与系统工程方向）</strong>
                        <span>2019.09-2023.06</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="px-2 py-1 text-sm">
                            校先进个人
                        </Badge>
                        <Badge variant="outline" className="px-2 py-1 text-sm">
                            校优秀志愿者
                        </Badge>
                        <Badge variant="outline" className="px-2 py-1 text-sm">
                            优秀团干
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>
                        {dictionaries.about.honor}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <TimeItem title="第五届'航天宏图&华为云杯'PIE软件开发者大赛——国家三等奖" time="2022年11月" />
                        <TimeItem title="全国高校数字艺术设计大赛——国家二等奖" time="2021年6月" />
                        <TimeItem title="三维数字化创新设计大赛校内选拔赛——校特等奖" time="2020年12月" />
                        <TimeItem title="第八届全国大学生数字媒体科技作品及创意竞赛——国家二等奖" time="2020年11月" />
                    </div>
                </CardContent>
            </Card>

            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>{dictionaries.about.skills}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {["Unity3D", "C#", "C++", "Cocos2d-x", "SteamVR", "HTML/JS/CSS"].map((skill) => (
                            <Badge key={skill} variant="outline" className="px-3 py-1">
                                {skill}
                            </Badge>
                        ))}
                    </div>

                    <ul className="mt-4 space-y-2">
                        <ListItem title="语言：" content="英语（CET-4 456分，CET-6 415分）" />
                        <ListItem title="兴趣爱好：" content="街舞（hiphop/urban/poping）、读书（微信读书700h+）" />
                    </ul>
                </CardContent>
            </Card>

            <Card className="my-4 hover:shadow-md">
                <CardHeader>
                    <CardTitle>{dictionaries.about.work_experience}</CardTitle>
                </CardHeader>
                <CardContent>
                    <TimelineItem
                        title="广东航天宏图信息技术有限公司 - U3D软件工程师"
                        time="2022.09-至今"
                        projects={[
                            {
                                title: "广东工贸职业技术学院虚拟仿真教学实训系统二期项目",
                                content: "1. 负责项目PC端及VR端全部技术开发工作（包括但不限于基于Unity的框架设计与搭建、UGUI及模型动画交互等业务逻辑的实现、性能与资源优化、打包及项目管理平台的接口测试与对接等）；\n2. 遥感技术专业虚拟仿真实训中心设备安装进度的跟进，设备维护，沉浸体验仓和混合现实设备对校方人员的使用培训，遥感技术专业虚拟仿真\n3. 实训中心设备领导参观演示；\n4. 协同部门成员与校方对接确定需求并落实到项目中。"
                            },
                            {
                                title: "泽朗风电设备VR培训系统",
                                content: "1. 负责项目大部分技术开发工作（包括但不限于基于Unity的框架设计与搭建、UGUI及模型动画交互等业务逻辑的实现、性能与资源优化、基于SteamVr与HTC VIVE等VR设备的交互实现与测试)；\n2. 作为技术负责人安排管理项目开发工作，保证项目顺利推进；\n3. 前往福州泽朗风力发电场进行VR展厅的布置和VR培训系统的测试，演示，以及人员的使用培训。\n4. 协同部门成员与甲方对接确定需求并落实到项目"
                            },
                            {
                                title: "黑龙江工程学院智慧屏项目",
                                content: "1. 基于GNSS测量技术虚拟仿真教学系统修改以部署到黑龙江工程学院智慧屏系统；"
                            },
                            {
                                title: "其它",
                                content: "1. 参与原数字地球U3D项目Demo的研发工作，前期主要负责高程、地图瓦片等开放接口的测试与框架逻辑的文本整理，后期测试并实现了基于Cesium for Unity插件的U3D数字地球Demo。\n2. 配合公司参与电力设计院项目谈判及根据需求完成UE5的Demo开发、协同部门同事调试HoloLens 2局域网下的环境部署、出差参与项目投标等工作。"
                            }
                        ]}
                    />

                    <TimelineItem
                        title="广西北部湾大学 - 项目组组长 资源与环境学院实验室"
                        time="2022.06-2022.09"
                        projects={[
                            {
                                title: "PIE EngineStdio城市扩张可视化系统",
                                content: "1. 作为项目组组长协同项目组完成了基于PIE EngineStdio云开发平台搭建的一个广西壮族自治区城市扩张的可视化研究系统。项目最终获得第五届PIE软件开发者大赛云开发组国家三等奖。\n2. 设计并搭建了项目基本框架及可扩展UI界面，完成了自然因素的FVC、NDVI、NDBI遥感数据提取及指数计算、图表可视化。实现了Gm(1,1)、Gm(1,n)算法，并完成了算法的广西壮族自治区建成区面积的模型验证及未来五年预测。"
                            }
                        ]}
                    />
                </CardContent>
            </Card>

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
                    <AlertTitle>{project.title}</AlertTitle>
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

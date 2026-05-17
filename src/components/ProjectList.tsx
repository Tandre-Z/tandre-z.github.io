import games from '@/data/games.json'
import projects from '@/data/projects.json'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProjectListProps {
    className?: string;
    lang: string;
    listType: 'games' | 'projects';
}

const ProjectList: React.FC<ProjectListProps> = ({ className, lang, listType }) => {
    const listData = listType === 'games' ? games : projects;

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
            {listData.map((game) => (
                <Card key={game.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>
                            <a
                                href={game.link}
                                className="text-red-500 hover:text-red-600 font-medium"
                                aria-label={`查看项目 ${game.name}`}
                            >
                                {game.name}
                            </a>
                        </CardTitle>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{game.date}</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{lang === 'zh' ? game.desc_cn : game.desc_en}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{game.tag}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default ProjectList;

import games from '@/data/games.json'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProjectListProps {
    className?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({ className }) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
            {games.map((game) => (
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
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{game.desc}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{game.type}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default ProjectList;

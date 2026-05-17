import config from "@/data/config.json";
import { getDictionary } from "@/lib/dictionaries";

type LastUpdatedProps = {
    lang: string;
    author?: string;
};

export default async function LastUpdated({
    lang,
    author = "TandreZ",
}: LastUpdatedProps) {
    const dictionaries = await getDictionary(lang);

    return (
        <div className="mt-16 text-left text-sm text-gray-500 dark:text-gray-400 space-y-1 opacity-75 hover:opacity-100 transition-opacity">
            <p className="tracking-wide">{dictionaries.common.last_updated} {config.last_updated_time}</p>
            <p className="font-mono text-primary dark:text-primary-dark">{author}</p>
        </div>
    );
}

import { getDictionary } from "@/lib/dictionaries";

export default async function Footer({
    params: { lang },
}: {
    params: { lang: string }
}) {
    const dictionaries = await getDictionary(lang);
    return (
        <div>
            <p>{dictionaries.footer.copyright}</p>
        </div>
    )
}
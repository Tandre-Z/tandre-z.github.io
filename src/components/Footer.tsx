import { getDictionary } from "@/lib/dictionaries";

export default async function Footer({ params }: { params: { lang: string } }) {
    const dictionaries = await getDictionary(params.lang);
    return (
        <div>
            <p>{dictionaries.footer.copyright}</p>
        </div>
    )
}
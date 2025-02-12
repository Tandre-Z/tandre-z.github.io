import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default function BlogList() {
    const posts = getAllPosts()

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">最新文章</h1>
            <div className="space-y-6">
                {posts.map(post => (
                    <article key={post.slug} className="border-b pb-6">
                        <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                            <h2 className="text-2xl font-semibold">{post.title}</h2>
                            <p className="text-gray-500 mt-2">{post.date}</p>
                            <p className="mt-2 text-gray-700">{post.excerpt}</p>
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    )
} 
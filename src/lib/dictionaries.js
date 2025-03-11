const dictionaries = {
    'zh': () => import('@/dictionaries/zh.json').then(module => module.default),
    'en': () => import('@/dictionaries/en.json').then(module => module.default),
};

export const getDictionary = async (lang) => {
    return await dictionaries[lang]();
}


export const getUniqueString = (pref?: string) => {
    if (pref) return `${pref}-${(new Date()).toISOString()}`;
    return `${(new Date()).toISOString()}`;
}
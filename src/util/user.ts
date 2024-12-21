export const isValidUsername = (input: string) => {
    const pattern = /^[a-z][a-z0-9_]+$/;
    return input.length > 3 && input.length <= 20 && input[0] != '.' && input[input.length-1] != '.' && pattern.test(input);
}



export const isValidDisplayName = (input: string) => {
    return input.length > 0 && input.length <= 30;
}
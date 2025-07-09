
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{10,}$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const acceptablePasswordRegexPattern: RegExp = /.{10,}/;

export const isValidEmail = (value: string): boolean => {
    return emailRegexPattern.test(value);
}

export const isValidPassword = (value: string): boolean => {
    return passwordRegexPattern.test(value);
}

export const isAnAcceptablePassword = (value: string): boolean => {
    return acceptablePasswordRegexPattern.test(value);
}

export const isValidUUID = (id: string): boolean => {
    return uuidRegex.test(id);
}

export const passwordPolicy: string = `Password must contain at least one lower-letter, at least one Upper-letter,at least one digit, at least one special caracter {#?!@$%^&*-}`
export const acceptablePasswordPolicy: string = `Password must contain at leastt six (10) characters`


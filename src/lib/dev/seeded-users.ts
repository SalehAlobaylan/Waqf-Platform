export const SEEDED_USERS = {
    admin: "admin@gmail.com",
    omar: "omar@example.com",
    fatima: "fatima@example.com",
    yusuf: "yusuf@example.com",
    aisha: "aisha@example.com",
    khalid: "khalid@example.com",
    noura: "noura@example.com",
    ahmed: "ahmed@example.com",
    layla: "layla@example.com",
} as const;

export type SeededUserKey = keyof typeof SEEDED_USERS;

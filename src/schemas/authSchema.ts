import { z } from 'zod'

export const authSchema = z.object({
  username: z.string().trim().min(1, 'Вкажіть логін'),
  password: z
    .string()
    .min(1, 'Вкажіть пароль')
    .min(6, 'Пароль має містити щонайменше 6 символів'),
})

export type AuthFormData = z.infer<typeof authSchema>

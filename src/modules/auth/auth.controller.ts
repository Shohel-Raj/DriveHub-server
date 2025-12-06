import { Request, Response } from 'express';
import { authService } from './auth.service';

const signup = async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !phone) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const user = await authService.createUser({ name, email, password, phone, role });
    return res.status(201).json({ data: user });
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const result = await authService.signinUser(email as string, password as string);
    return res.json({ data: result });
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

export const authController= {
    signin,
    signup
}

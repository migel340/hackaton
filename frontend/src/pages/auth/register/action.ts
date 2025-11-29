import { registerUser } from "../../../api/auth";

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  return registerUser(data);
}

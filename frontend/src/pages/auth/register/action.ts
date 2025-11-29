// Prosty wrapper pod akcję rejestracji — analogicznie do login/action.ts.
import { registerUser } from "../../../api/auth";

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  return registerUser(data);
}

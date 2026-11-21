import { Gilded } from "@/components/gilded/Gilded";
import { IDENTITY } from "@/lib/profile";

export { MAIL, trackEmail } from "@/lib/mail";

/** The email, gilded: the address by default, a mailto that copies too (see Gilded's email variant). */
export function MailLink({ src, children }: { src: string; children?: React.ReactNode }) {
  return (
    <Gilded variant="email" src={src}>
      {children ?? IDENTITY.email}
    </Gilded>
  );
}

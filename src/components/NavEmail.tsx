import { Gilded } from "./gilded/Gilded";

/** The quiet second action in the blog bar, beside the call: the gilded email, counted as email_open from the blog nav. */
export function NavEmail() {
  return (
    <Gilded variant="email" src="blog-nav">
      email
    </Gilded>
  );
}

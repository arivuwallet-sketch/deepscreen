/** Insert only: the public newsletter role intentionally cannot read or update subscribers. */
export async function requestNewsletterSubscription(
  email: string,
  insert: (row: {
    email: string;
    source: "website";
  }) => PromiseLike<{ error: { code?: string } | null }>,
): Promise<boolean> {
  try {
    const { error } = await insert({ email: email.trim().toLowerCase(), source: "website" });
    // Give the same confirmation for new and existing addresses.
    return !error || error.code === "23505";
  } catch {
    return false;
  }
}

export function match<
  TValue extends string | number = string,
  TReturnValue = unknown,
  Args extends unknown[] = unknown[],
>(
  value: TValue,
  lookup: Record<TValue, TReturnValue | ((...args: Args) => TReturnValue)>,
  ...args: Args
): TReturnValue {
  if (value in lookup) {
    const returnValue = lookup[value];
    return typeof returnValue === "function"
      ? returnValue(...args)
      : (returnValue as TReturnValue);
  }

  const error = new Error(
    `Tried to handle "${value}" but there is no handler defined. Only defined handlers are: ${Object.keys(
      lookup,
    )
      .map((key) => `"${key}"`)
      .join(", ")}.`,
  );
  if (Error.captureStackTrace) Error.captureStackTrace(error, match);
  throw error;
}

export function formToObject(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => String(value).trim() !== "")
  );
}

export function labelize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function fieldInputType(name) {
  if (name === "email") {
    return "email";
  }

  if (name === "password") {
    return "password";
  }

  return "text";
}

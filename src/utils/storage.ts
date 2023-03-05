export const storage = {
  getAddress:
    typeof window !== "undefined"
      ? () => localStorage.getItem("address")
      : () => null,
  setAddress: (address: string) => localStorage.setItem("address", address),
  removeAddress: () => localStorage.removeItem("address"),
};

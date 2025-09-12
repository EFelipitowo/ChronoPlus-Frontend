// No replicar
export const getAllUsers = async () => {
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("Error fetching encargados");
    return response.json();
};
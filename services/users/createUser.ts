interface createUserInput {
  userId: string | undefined;
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface createUserResponse {
  isSucessful: boolean;
  error?: string;
}

const serverAPI = "http://localhost:3000/api/v1/users/create";

async function createUser(input: createUserInput): Promise<createUserResponse> {
  try {
    const response = await fetch(serverAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to create user:", error);
    return {
      isSucessful: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default createUser;

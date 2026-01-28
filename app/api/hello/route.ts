

export async function GET(request:Request) {
    // Create a simple response object
    const responseData = {
      message: "Hello from Next.js backend!",
      timestamp: new Date().toISOString(),
      method: "GET"
    };
  
 
    return Response.json(responseData, {
        status:400,
    });
  }
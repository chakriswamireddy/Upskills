// export type RoleType= "STUDENT" | "INSTRUCTOR" | "ADMIN";
export const Roles = {
    student: "STUDENT",
    instructor: "INSTRUCTOR",
    admin: "ADMIN",
  } as const;
  
  export type RoleType = typeof Roles[keyof typeof Roles];
  

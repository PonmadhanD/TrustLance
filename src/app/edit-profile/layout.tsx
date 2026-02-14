import React from "react";

export default function EditProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // No header or footer for edit profile page
    return <>{children}</>;
}
 
"use client";

import Footer from "@/layout/public/Footer";
import Header from "@/layout/public/Header";
import React from "react";

const PublicLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};

export default PublicLayout;

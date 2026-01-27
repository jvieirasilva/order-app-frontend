"use client";

import { Suspense } from "react";
import RegisterAdminClient from "./RegisterAdminClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterAdminClient />
    </Suspense>
  );
}

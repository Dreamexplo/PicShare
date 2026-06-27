const fs = require("fs");
const p = "E:/XML/picture_books/src/app/dashboard/create/page.tsx";
let c = fs.readFileSync(p, "utf-8");

c = c.replace(
  'import { useState } from "react";',
  'import { useState, useEffect } from "react";\nimport { useRouter } from "next/navigation";'
);

const authCode = `
  useEffect(() => {
    if (localStorage.getItem("admin_authenticated") !== "true") {
      window.location.href = "/dashboard/login";
    }
  }, []);
`;

const idx = c.lastIndexOf("useState(");
const end = c.indexOf("\n", c.indexOf(";", c.indexOf(")", idx)));
c = c.slice(0, end + 1) + authCode + c.slice(end + 1);

fs.writeFileSync(p, c);
console.log("OK: create page");
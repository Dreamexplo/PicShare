const fs = require("fs");
const path = require("path");

const files = [
  "E:/XML/picture_books/src/app/dashboard/page.tsx",
  "E:/XML/picture_books/src/app/dashboard/create/page.tsx",
  "E:/XML/picture_books/src/app/dashboard/albums/[id]/page.tsx",
];

function addAuthCheck(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  const authCode = `
  useEffect(() => {
    if (localStorage.getItem("admin_authenticated") !== "true") {
      window.location.href = "/dashboard/login";
    }
  }, []);
`;

  const idx = content.indexOf("useEffect(()");
  if (idx !== -1) {
    content = content.slice(0, idx) + authCode + content.slice(idx);
    fs.writeFileSync(filePath, content);
    console.log("OK: " + filePath);
  } else {
    console.log("SKIP (no useEffect): " + filePath);
  }
}

files.forEach(addAuthCheck);
console.log("Done");
import { getSession } from 'next-auth/react';
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/Leave';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  try {
    // Find all leave applications for the logged-in user
    const myLeaves = await Leave.find({ user: session.user.id })
      .sort({ createdAt: -1 }); // Sort by most recent

    res.status(200).json(myLeaves);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/*

```

### 3. Sidebar Mein Badlav

Ab hum `Sidebar.js` mein non-admin users ke liye "My Leaves" ka link add karenge.

```diff
--- a/d:\project\dataEntry\user-data-app\components\Sidebar.js
+++ b/d:\project\dataEntry\user-data-app\components\Sidebar.js
@@ -10,6 +10,7 @@
   FiChevronsRight,
   FiFileText,
   FiUserCheck,
+  FiCalendar,
 } from "react-icons/fi";
 
 const Sidebar = () => {
@@ -46,7 +47,8 @@
   } else {
     // Regular user specific links
     navLinks.push(
-      { name: "Apply for Leave", href: "/leave-application", icon: FiFileText }
+      { name: "Apply for Leave", href: "/leave-application", icon: FiFileText },
+      { name: "My Leaves", href: "/my-leaves", icon: FiCalendar }
     );
   }
 

```

In badlavon ke baad, aapka leave management system ka basic flow poora ho jayega. User leave apply kar sakta hai, manager use approve/reject kar sakta hai, aur user apni application ka status dekh sakta hai.

<!--
[PROMPT_SUGGESTION]How can I add a filter to the manager's leave application page (e.g., filter by status or employee)?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]How can I show a notification count for pending leaves on the manager's sidebar?[/PROMPT_SUGGESTION]
-->

*/
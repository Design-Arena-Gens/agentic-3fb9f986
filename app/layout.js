export const metadata = {
  title: "Gym Scheduler",
  description: "Plan your weekly workouts with a clean scheduler"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}


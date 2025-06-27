import Container from "@/app/_components/container";

export default function HomePage() {
  return (
    <main>
      <Container>
        <div className="mt-16">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
            Home.
          </h1>
          <div className="text-lg leading-relaxed mt-8">
            Welcome to the home page.
          </div>
        </div>
      </Container>
    </main>
  );
}

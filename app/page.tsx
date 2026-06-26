import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ArrowRight, Zap, Code2, Clock, Beaker } from 'lucide-react'
import Link from 'next/link'
import { TOOLS, CATEGORY_INFO, TOOLS_CATEGORIES } from '@/lib/constants'

export default function Home() {
  const featuredTools = TOOLS.slice(0, 6)
  const categories = Object.values(TOOLS_CATEGORIES)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container-main py-20 md:py-32 flex flex-col items-center text-center gap-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Free Tools For All Developers</span>
          </div>

          <div className="flex flex-col gap-6 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
              Developer Tools,
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance">
              Comprehensive collection of free, powerful tools to enhance your development workflow. No signup required—use them instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/tools" className="btn-primary flex items-center gap-2 text-lg">
              Explore Tools
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="btn-secondary flex items-center gap-2 text-lg">
              Learn More
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container-main py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card-base text-center">
              <div className="p-4 rounded-lg bg-primary/10 w-fit mx-auto mb-4">
                <Code2 size={32} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">100+ Tools</h3>
              <p className="text-muted-foreground">
                A comprehensive suite of developer utilities covering everything from JSON formatting to data generation.
              </p>
            </div>
            <div className="card-base text-center">
              <div className="p-4 rounded-lg bg-accent/10 w-fit mx-auto mb-4">
                <Zap size={32} className="text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Access</h3>
              <p className="text-muted-foreground">
                No signup, no installation. Use any tool immediately from your browser without any hassle.
              </p>
            </div>
            <div className="card-base text-center">
              <div className="p-4 rounded-lg bg-blue-500/10 w-fit mx-auto mb-4">
                <Beaker size={32} className="text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Always Free</h3>
              <p className="text-muted-foreground">
                All tools are completely free. No subscriptions, no premium features, no limitations.
              </p>
            </div>
          </div>
        </section>

        {/* Tool Categories */}
        <section className="container-main py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Powerful Categories</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Organized by function for easy discovery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const info = CATEGORY_INFO[category]
              const IconComponent = require('lucide-react')[info.icon]
              return (
                <Link key={category} href={`/tools?category=${category}`}>
                  <div className="card-base group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent size={20} className="text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {info.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {info.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Featured Tools */}
        <section className="container-main py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Featured Tools</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Get started with our most popular utilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredTools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}`}>
                <div className="card-base group">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Try it <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/tools" className="btn-primary inline-flex items-center gap-2">
              View All Tools
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-main py-20 md:py-32">
          <div className="card-base bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to level up?</h2>
            <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
              Create an account to save your favorite tools, build custom workflows, and unlock personalized features like notes and todo lists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools" className="btn-primary text-lg">
                Start Using Tools Now
              </Link>
              <Link href="#" className="btn-secondary text-lg">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

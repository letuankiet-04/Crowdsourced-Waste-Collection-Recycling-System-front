
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Container from "../../components/ui/Container";
export default function CTASection(){

    return(
        <>
        
          <section className="bg-emerald-50 py-16 text-center">
            <Container>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Ready to make a difference?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Join citizens contributing to a cleaner community.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button as={Link} to="/auth/signup" size="lg">
                  Sign Up Now
                </Button>
                <Button as={Link} to="/contact" size="lg" variant="outline">
                  Contact Sales
                </Button>
              </div>
            </Container>
          </section>
    </>
    )
}

import { businessInfo } from "@/lib/salesData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePanel() {
  const branches = [
    "BAYAN",
    "GULOD",
    "CUENCA",
    "STA. TERESITA",
    "AGONCILLO",
    "CALOOCAN",
  ];

  const owners = [
    { name: "Mr. Joseph B. Gomez", role: "Owner" },
    { name: "Dr. Norelyn Gomez", role: "Owner" },
  ];

  const services = [
    "Retail and wholesale LPG supply",
    "Bulk tank deliveries",
    "Refill services for residential and commercial clients",
    "Quality assured products",
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Business Info */}
      <motion.div className="text-center" variants={fadeIn}>
        <h2 className="text-4xl font-bold">{businessInfo.name}</h2>
        <p className="text-muted-foreground mt-2">{businessInfo.description}</p>
      </motion.div>

      {/* About Us Card */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>About Us</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            We are a trusted LPG trading company dedicated to providing
            high-quality liquefied petroleum gas products to our customers. With
            multiple branches across the region, we ensure reliable and efficient
            service.
          </CardContent>
        </Card>
      </motion.div>

      {/* Owners Grid */}
      <motion.div variants={fadeIn}>
        <h3 className="text-2xl font-semibold mb-4">Owners</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {owners.map((owner) => (
            <Card key={owner.name}>
              <CardHeader>
                <CardTitle>{owner.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {owner.role}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Name Origin Card */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Our Name</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            The name <strong>CJG</strong> is derived from the names of their
            children: Christine Gomez, John Joseph Gomez, and their family last name
            Gomez.
          </CardContent>
        </Card>
      </motion.div>

      {/* Branches Grid */}
      <motion.div variants={fadeIn}>
        <h3 className="text-2xl font-semibold mb-4">Our Branches</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card key={branch}>
              <CardHeader>
                <CardTitle>{branch}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Located in the {branch} area, serving customers with reliable
                LPG delivery and services.
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Services Grid */}
      <motion.div variants={fadeIn}>
        <h3 className="text-2xl font-semibold mb-4">Our Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card key={service}>
              <CardContent className="text-muted-foreground">
                {service}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Contact Card */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {businessInfo.contact}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

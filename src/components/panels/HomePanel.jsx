import { businessInfo } from "@/lib/salesData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-8">
      {/* Business Info */}
      <div className="text-center">
        <h2 className="text-4xl font-bold">{businessInfo.name}</h2>
        <p className="text-muted-foreground mt-2">{businessInfo.description}</p>
      </div>

      {/* About Us Card */}
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

      {/* Owners Grid */}
      <div>
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
      </div>

      {/* Name Origin Card */}
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

      {/* Branches Grid */}
      <div>
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
      </div>

      {/* Services Grid */}
      <div>
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
      </div>

      {/* Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          {businessInfo.contact}
        </CardContent>
      </Card>
    </div>
  );
}

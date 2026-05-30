from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = "Generate seed users (customers, drivers, restaurant owners)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--customers",
            type=int,
            default=100,
            help="Number of customer accounts to create (default: 100).",
        )
        parser.add_argument(
            "--drivers",
            type=int,
            default=100,
            help="Number of driver accounts to create (default: 100).",
        )
        parser.add_argument(
            "--restaurants",
            type=int,
            default=50,
            help="Number of restaurant owner accounts to create (default: 50).",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="password123",
            help="Password for all generated users (default: password123).",
        )
        parser.add_argument(
            "--domain",
            type=str,
            default="foody.test",
            help="Email domain for generated users (default: foody.test).",
        )

    def handle(self, *args, **options):
        customers = max(0, options["customers"])
        drivers = max(0, options["drivers"])
        restaurants = max(0, options["restaurants"])
        password = options["password"]
        domain = options["domain"].lstrip("@")

        specs = [
            ("customer", customers, {"is_customer": True}),
            ("driver", drivers, {"is_driver": True}),
            ("restaurant", restaurants, {"is_restaurant": True}),
        ]

        created_total = 0
        skipped_total = 0

        with transaction.atomic():
            for role, count, flags in specs:
                created, skipped = self._seed_role(role, count, domain, password, flags)
                created_total += created
                skipped_total += skipped

        self.stdout.write(
            self.style.SUCCESS(
                "Seed users complete: "
                f"created={created_total}, skipped={skipped_total}, "
                f"password={password!r}, domain={domain!r}"
            )
        )

    def _seed_role(self, role: str, count: int, domain: str, password: str, flags: dict):
        created = 0
        skipped = 0
        pad = max(3, len(str(count)))

        for index in range(1, count + 1):
            email = f"{role}{index:0{pad}d}@{domain}"
            if User.objects.filter(email=email).exists():
                skipped += 1
                continue

            User.objects.create_user(email=email, password=password, **flags)
            created += 1
            self.stdout.write(f"  {role}: created={email}")

        self.stdout.write(
            f"  {role}: requested={count}, created={created}, skipped={skipped}"
        )
        return created, skipped

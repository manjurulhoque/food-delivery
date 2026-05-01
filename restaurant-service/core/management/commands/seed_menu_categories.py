from django.core.management.base import BaseCommand

from core.models import MenuCategory


class Command(BaseCommand):
    help = "Insert bulk menu categories"

    def handle(self, *args, **kwargs):
        categories = [
            "Pizza",
            "Burgers",
            "Pasta",
            "Salads",
            "Sandwiches",
            "Seafood",
            "Steak",
            "BBQ",
            "Sushi",
            "Desserts",
            "Drinks",
            "Breakfast",
            "Snacks",
            "Soup",
            "Rice Bowls",
            "Wraps",
            "Vegan",
            "Chicken",
            "Mexican",
            "Indian",
            "Thai",
            "Chinese",
            "Middle Eastern",
            "Fast Food",
            "Healthy",
        ]

        created_count = 0
        existing_count = 0

        for category_name in categories:
            _, created = MenuCategory.objects.get_or_create(name=category_name)
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Menu categories processed: {len(categories)} | created: {created_count} | existing: {existing_count}"
            )
        )

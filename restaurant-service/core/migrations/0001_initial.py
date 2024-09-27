# Generated by Django 4.2.9 on 2024-09-27 05:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Restaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('address', models.TextField()),
                ('phone', models.CharField(max_length=20)),
                ('user_id', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='RestaurantOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('order_id', models.IntegerField()),
                ('restaurant_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.restaurant')),
            ],
        ),
        migrations.CreateModel(
            name='Menu',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('price', models.FloatField()),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.restaurant')),
            ],
        ),
    ]

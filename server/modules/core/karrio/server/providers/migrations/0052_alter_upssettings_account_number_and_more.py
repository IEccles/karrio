# Generated by Django 4.2.1 on 2023-06-04 15:44

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("providers", "0051_rename_username_upssettings_client_id_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="upssettings",
            name="account_number",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.DeleteModel(
            name="UPSFreightSettings",
        ),
    ]
# Generated by Django 4.2.14 on 2024-08-06 06:12

from django import forms
from django.conf import settings
from django.db import migrations, models, transaction
import django.db.models.deletion
import functools
import karrio.server.core.models


@transaction.atomic
def forwards_func(apps, schema_editor):
    from karrio.server.providers.models import MODELS

    db_alias = schema_editor.connection.alias
    Carrier = apps.get_model("providers", "Carrier")
    RateSheet = apps.get_model("providers", "RateSheet")

    carrier_accounts = Carrier.objects.using(db_alias).all().iterator()

    for _carrier in carrier_accounts:
        _carrier_name, _settings = next(
            (
                (
                    name,
                    _carrier.metadata.get("__settings")
                    or forms.model_to_dict(getattr(_carrier, model.__name__.lower())),
                )
                for name, model in MODELS.items()
                if hasattr(_carrier, model.__name__.lower())
            ),
            ("eshipper", _carrier.metadata.get("__settings", {})),
        )

        _services = _settings.pop("services", {})
        _carrier.credentials = {
            key: value
            for key, value in _settings.items()
            if key
            not in [
                "active",
                "services",
                "rate_sheet",
                "carrier_ptr",
                "is_system",
                "capabilities",
                "active_users",
                "created_by",
                "test_mode",
                "metadata",
                "credentials",
                "carrier_code",
                "carrier_id",
            ]
        }
        _carrier.carrier_code = _carrier_name
        _carrier.metadata = {
            key: value
            for key, value in (_carrier.metadata or {}).items()
            if key not in ["__settings"]
        }

        if "username" in _settings and "password" in _settings:
            if _carrier_name == "usps":
                _carrier.carrier_code = "usps_wt"
            if _carrier_name == "usps_international":
                _carrier.carrier_code = "usps_wt_international"

        if any(_services):
            settings = getattr(_carrier, MODELS[_carrier_name].__name__.lower())
            _carrier.rate_sheet = karrio.server.core.models._identity(
                getattr(settings, "rate_sheet", None)
                or RateSheet.objects.create(
                    name=f"{_carrier_name} - sheet",
                    slug=f"{_carrier_name} - rate-sheet",
                    carrier_name=_carrier_name,
                    is_system=_carrier.is_system,
                    created_by=_carrier.created_by,
                )
            )
            _carrier.rate_sheet.services.set(_services)

        _carrier.save(using=db_alias)


def reverse_func(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        (
            "providers",
            "0076_rename_customer_registration_id_uspsinternationalsettings_account_number_and_more",
        ),
    ]

    operations = [
        migrations.CreateModel(
            name="USPSWTInternationalSettings",
            fields=[
                (
                    "carrier_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="providers.carrier",
                    ),
                ),
                ("username", models.CharField(max_length=200)),
                ("password", models.CharField(max_length=200)),
                ("mailer_id", models.CharField(blank=True, max_length=200, null=True)),
                (
                    "customer_registration_id",
                    models.CharField(blank=True, max_length=200, null=True),
                ),
                (
                    "logistics_manager_mailer_id",
                    models.CharField(blank=True, max_length=200, null=True),
                ),
            ],
            options={
                "verbose_name": "USPS Web Tools International Settings",
                "verbose_name_plural": "USPS Web Tools International Settings",
                "db_table": "usps_wt_international-settings",
            },
            bases=("providers.carrier",),
        ),
        migrations.CreateModel(
            name="USPSWTSettings",
            fields=[
                (
                    "carrier_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="providers.carrier",
                    ),
                ),
                ("username", models.CharField(max_length=200)),
                ("password", models.CharField(max_length=200)),
                ("mailer_id", models.CharField(blank=True, max_length=200, null=True)),
                (
                    "customer_registration_id",
                    models.CharField(blank=True, max_length=200, null=True),
                ),
                (
                    "logistics_manager_mailer_id",
                    models.CharField(blank=True, max_length=200, null=True),
                ),
            ],
            options={
                "verbose_name": "USPS Web Settings",
                "verbose_name_plural": "USPS Web Settings",
                "db_table": "usps_wt-settings",
            },
            bases=("providers.carrier",),
        ),
        migrations.AlterModelOptions(
            name="carrier",
            options={},
        ),
        migrations.RemoveField(
            model_name="belgianpostsettings",
            name="rate_sheet",
        ),
        migrations.RemoveField(
            model_name="colissimosettings",
            name="rate_sheet",
        ),
        migrations.RemoveField(
            model_name="dhlparceldesettings",
            name="rate_sheet",
        ),
        migrations.RemoveField(
            model_name="dhlpolandsettings",
            name="rate_sheet",
        ),
        migrations.RemoveField(
            model_name="dpdhlsettings",
            name="rate_sheet",
        ),
        migrations.RemoveField(
            model_name="dpdsettings",
            name="rate_sheet",
        ),
        migrations.RemoveField(
            model_name="genericsettings",
            name="rate_sheet",
        ),
        migrations.AddField(
            model_name="carrier",
            name="carrier_code",
            field=models.CharField(
                db_index=True,
                default="generic",
                help_text="eg. dhl_express, fedex, ups, usps, ...",
                max_length=100,
            ),
        ),
        migrations.AddField(
            model_name="carrier",
            name="credentials",
            field=models.JSONField(
                default=functools.partial(
                    karrio.server.core.models._identity, *(), **{"value": {}}
                ),
                help_text="Carrier connection credentials",
            ),
        ),
        migrations.AddField(
            model_name="carrier",
            name="rate_sheet",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="providers.ratesheet",
            ),
        ),
        migrations.AlterField(
            model_name="carrier",
            name="active_users",
            field=models.ManyToManyField(
                blank=True, related_name="connection_users", to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AlterField(
            model_name="carrier",
            name="carrier_id",
            field=models.CharField(
                db_index=True,
                help_text="eg. canadapost, dhl_express, fedex, purolator_courrier, ups...",
                max_length=150,
            ),
        ),
        migrations.RunPython(forwards_func, reverse_func),
    ]

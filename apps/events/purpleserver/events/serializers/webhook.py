from purpleserver.serializers import owned_model_serializer
from purpleserver.events.serializers import WebhookData
from purpleserver.events.models import Webhook


@owned_model_serializer
class WebhookSerializer(WebhookData):

    def create(self, validated_data: dict, **kwargs) -> Webhook:
        return Webhook.objects.create(**validated_data)

    def update(self, instance: Webhook, validated_data: dict, **kwargs) -> Webhook:
        for key, val in validated_data.items():
            setattr(instance, key, val)

        instance.save()
        return instance

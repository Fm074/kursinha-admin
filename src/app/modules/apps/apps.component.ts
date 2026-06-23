import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UtmfyService } from './services/utmfy.service';
import { WebhooksService, WebhookPayload } from './services/webhooks.service';

interface IntegrationEvent {
  key: string;
  label: string;
  description: string;
  triggerLabel: string;
  enabled: boolean;
  lastSentAt?: string;
}

interface Integration {
  id: 'utmify' | 'webhooks';
  name: string;
  logo: string;
  category: string;
  description: string;
  active: boolean;
  connectedEvents: number;
  drawerSubtitle: string;
  showUrlField: boolean;
  events: IntegrationEvent[];
}

interface AvailableEventDefinition {
  key: string;
  label: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
}
@Component({
  selector: 'app-apps',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './apps.component.html',
  styleUrl: './apps.component.scss',
})
export class AppsComponent implements OnInit {
  integrations: Integration[] = [
    {
      id: 'utmify',
      name: 'UTMify',
      logo: 'assets/img/utmfy.png',
      category: 'Rastreamento de campanhas',
      description:
        'Envie eventos de vendas da Kursinha diretamente para o UTMify e acompanhe o desempenho das campanhas.',
      active: true,
      connectedEvents: 3,
      drawerSubtitle: 'Veja e gerencie os eventos enviados para o UTMify.',
      showUrlField: false,
      events: [
       
      ],
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      category: 'Integrações avançadas',
      logo: 'assets/img/webhooks.png',
      description:
        'Receba notificações HTTP em tempo real sempre que eventos importantes acontecerem na Kursinha.',
      active: true,
      connectedEvents: 4,
      drawerSubtitle:
        'Configure o endpoint e escolha quais eventos a Kursinha deve disparar.',
      showUrlField: true,
      events: [
        
      ],
    },
  ];

  availableEvents: AvailableEventDefinition[] = [
    {
      key: 'sale_approved',
      label: 'Venda aprovada',
      description: 'Disparado quando o pagamento é aprovado.',
    },
    {
      key: 'sale_pending',
      label: 'Venda pendente',
      description:
        'Disparado enquanto o pagamento está em análise ou boleto aberto.',
    },
    {
      key: 'sale_refunded',
      label: 'Venda reembolsada',
      description: 'Disparado quando a venda é estornada.',
    },
    {
      key: 'subscription_canceled',
      label: 'Assinatura cancelada',
      description: 'Disparado quando a recorrência é cancelada.',
    },
  ];

  // mock de produtos
  products: Product[] = [
    { id: 'p1', name: 'Curso 1% Milionário' },
    { id: 'p2', name: 'Mentoria Drop Lucro 360º' },
    { id: 'p3', name: 'Programa Caçadores de Lucros' },
  ];

  selectedIntegration: Integration | null = null;
  isDrawerOpen = false;
  isConfigModalOpen = false;

  searchTerm = '';
  filteredEvents: IntegrationEvent[] = [];

  configForm!: FormGroup;
  utmfyForm!: FormGroup;
  isLoadingUtmfy = false;
  isSavingUtmfy = false;
  hasUtmfyConfig = false;
  // Webhooks
  webhooks: any[] = [];
  webhookForm!: FormGroup;
  isLoadingWebhooks = false;
  isSavingWebhook = false;
  webhookLogs: any[] = [];
  selectedWebhookId: string | null = null;
  webhookFeedback: string | null = null;
  webhookEventOptions = [
    { value: 'payment.completed', label: 'Pagamento aprovado' },
    { value: 'payment.failed', label: 'Pagamento falhou' },
    { value: 'order.created', label: 'Pedido criado' },
    { value: 'order.updated', label: 'Pedido atualizado' },
  ];

  constructor(
    private fb: FormBuilder,
    private utmfyService: UtmfyService,
    private webhooksService: WebhooksService
  ) {
    this.buildConfigForm();
    this.buildUtmfyForm();
    this.buildWebhookForm();
  }

  ngOnInit(): void {
    this.loadUtmfySettings();
  }

  private buildConfigForm() {
    const controls: Record<string, any> = {
      endpoint: [''],
      productScope: ['all'],
    };

    // um controle booleano por evento
    this.availableEvents.forEach((event) => {
      controls[event.key] = [false];
    });

    // um controle booleano por produto
    this.products.forEach((product) => {
      controls['product_' + product.id] = [false];
    });

    this.configForm = this.fb.group(controls);
  }

  private buildUtmfyForm() {
    this.utmfyForm = this.fb.group({
      apiKey: ['', Validators.required],
      workspace: ['', Validators.required],
      isActive: [true],
      trackPageViews: [true],
      trackEvents: [true],
      autoDetectUTM: [true],
      customEvents: [''],
    });
  }

  private buildWebhookForm() {
    this.webhookForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      url: ['', [Validators.required]],
      events: [[], Validators.required], // array of event keys
      secret: [''],
      isActive: [true],
      headers: [''],
      retryCount: [3],
      timeout: [30000],
    });
  }

  openIntegration(integration: Integration) {
    this.selectedIntegration = integration;
    this.isDrawerOpen = true;
    this.searchTerm = '';
    this.filteredEvents = [...integration.events];

    if (integration.id === 'utmify') {
      this.loadUtmfySettings();
    } else if (integration.id === 'webhooks') {
      this.loadWebhooks();
      this.loadWebhookLogsAll();
    }
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    this.selectedIntegration = null;
    this.isConfigModalOpen = false;
  }

  loadWebhooks() {
    this.isLoadingWebhooks = true;
    this.webhooksService.list().subscribe({
      next: (response: any) => {
        this.webhooks = response?.data || [];
        this.isLoadingWebhooks = false;
      },
      error: () => {
        this.isLoadingWebhooks = false;
        this.webhookFeedback = 'Não foi possível carregar os webhooks.';
      },
    });
  }

  loadWebhookLogsAll() {
    this.webhooksService.logsAll().subscribe({
      next: (response: any) => {
        this.webhookLogs = response?.data || [];
      },
      error: () => {
        this.webhookLogs = [];
      },
    });
  }

  editWebhook(webhook: any) {
    this.selectedWebhookId = webhook.id;
    this.webhookForm.patchValue({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events || [],
      secret: '',
      isActive: webhook.isActive,
      headers: webhook.headers ? JSON.stringify(webhook.headers) : '',
      retryCount: webhook.retryCount ?? 3,
      timeout: webhook.timeout ?? 30000,
    });
  }

  resetWebhookForm() {
    this.selectedWebhookId = null;
    this.webhookFeedback = null;
    this.webhookForm.reset({
      id: '',
      name: '',
      url: '',
      events: [],
      secret: '',
      isActive: true,
      headers: '',
      retryCount: 3,
      timeout: 30000,
    });
  }

  saveWebhook() {
    if (this.webhookForm.invalid) {
      this.webhookForm.markAllAsTouched();
      return;
    }
    this.isSavingWebhook = true;
    this.webhookFeedback = null;

    const raw = this.webhookForm.value;
    const payload: WebhookPayload = {
      name: raw.name,
      url: raw.url,
      events: (raw.events || []).filter((e: string) => !!e),
      secret: raw.secret || undefined,
      isActive: raw.isActive,
      retryCount: raw.retryCount,
      timeout: raw.timeout,
    };

    if (raw.headers) {
      try {
        payload.headers = JSON.parse(raw.headers);
      } catch (e) {
        this.isSavingWebhook = false;
        this.webhookFeedback = 'Cabeçalhos precisam estar em JSON válido.';
        return;
      }
    }

    const request$ = raw.id
      ? this.webhooksService.update(raw.id, payload)
      : this.webhooksService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSavingWebhook = false;
        this.webhookFeedback = 'Webhook salvo com sucesso.';
        this.resetWebhookForm();
        this.loadWebhooks();
      },
      error: () => {
        this.isSavingWebhook = false;
        this.webhookFeedback = 'Erro ao salvar webhook.';
      },
    });
  }

  toggleWebhookEvent(value: string, checked: boolean) {
    const current = [...(this.webhookForm.get('events')?.value || [])];
    if (checked) {
      if (!current.includes(value)) current.push(value);
    } else {
      const idx = current.indexOf(value);
      if (idx >= 0) current.splice(idx, 1);
    }
    this.webhookForm.get('events')?.setValue(current);
  }

  deleteWebhook(id: string) {
    this.isSavingWebhook = true;
    this.webhookFeedback = null;
    this.webhooksService.delete(id).subscribe({
      next: () => {
        this.isSavingWebhook = false;
        this.webhookFeedback = 'Webhook removido.';
        this.resetWebhookForm();
        this.loadWebhooks();
      },
      error: () => {
        this.isSavingWebhook = false;
        this.webhookFeedback = 'Erro ao remover webhook.';
      },
    });
  }

  loadWebhookLogs(id: string) {
    this.webhooksService.logs(id).subscribe({
      next: (response: any) => {
        this.webhookLogs = response?.data || [];
      },
      error: () => {
        this.webhookLogs = [];
      },
    });
  }

  loadUtmfySettings() {
    this.isLoadingUtmfy = true;
    this.utmfyService.getSettings().subscribe({
      next: (response: any) => {
        const data = response?.data;
        if (data) {
          this.hasUtmfyConfig = true;
          this.utmfyForm.patchValue({
            apiKey: data.apiKey || '',
            workspace: data.workspace || '',
            isActive: data.isActive ?? true,
            trackPageViews: data.utmSettings?.trackPageViews ?? true,
            trackEvents: data.utmSettings?.trackEvents ?? true,
            autoDetectUTM: data.utmSettings?.autoDetectUTM ?? true,
            customEvents: (data.utmSettings?.customEvents || []).join(', '),
          });
        } else {
          this.hasUtmfyConfig = false;
        }
        this.isLoadingUtmfy = false;
      },
      error: () => {
        this.isLoadingUtmfy = false;
        this.hasUtmfyConfig = false;
      },
    });
  }

  saveUtmfySettings() {
    if (this.utmfyForm.invalid) {
      this.utmfyForm.markAllAsTouched();
      return;
    }

    this.isSavingUtmfy = true;
    const raw = this.utmfyForm.value;
    const payload = {
      apiKey: raw.apiKey,
      workspace: raw.workspace,
      isActive: raw.isActive,
      utmSettings: {
        trackPageViews: raw.trackPageViews,
        trackEvents: raw.trackEvents,
        autoDetectUTM: raw.autoDetectUTM,
        customEvents: raw.customEvents
          ? raw.customEvents
              .split(',')
              .map((c: string) => c.trim())
              .filter((c: string) => !!c)
          : [],
      },
    };

    const request$ = this.hasUtmfyConfig
      ? this.utmfyService.updateSettings(payload)
      : this.utmfyService.createSettings(payload);

    request$.subscribe({
      next: () => {
        this.isSavingUtmfy = false;
        this.hasUtmfyConfig = true;
      },
      error: () => {
        this.isSavingUtmfy = false;
      },
    });
  }

  deleteUtmfySettings() {
    this.isSavingUtmfy = true;
    this.utmfyService.deleteSettings().subscribe({
      next: () => {
        this.isSavingUtmfy = false;
        this.hasUtmfyConfig = false;
        this.utmfyForm.reset({
          apiKey: '',
          workspace: '',
          isActive: true,
          trackPageViews: true,
          trackEvents: true,
          autoDetectUTM: true,
          customEvents: '',
        });
      },
      error: () => {
        this.isSavingUtmfy = false;
      },
    });
  }

  filterEvents() {
    if (!this.selectedIntegration) return;

    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredEvents = [...this.selectedIntegration.events];
      return;
    }

    this.filteredEvents = this.selectedIntegration.events.filter((event) =>
      (event.label + event.description + event.triggerLabel)
        .toLowerCase()
        .includes(term)
    );
  }

  toggleEvent(event: IntegrationEvent) {
    event.enabled = !event.enabled;
    // aqui no futuro: service HTTP para salvar a alteração
    console.log(
      `Evento ${event.key} em ${this.selectedIntegration?.id} agora está ${
        event.enabled ? 'ativo' : 'desativado'
      }`
    );
  }

  openConfigModal() {
    if (!this.selectedIntegration) return;

    // reset base
    this.configForm.reset({
      endpoint: '',
      productScope: 'all',
    });

    // endpoint atual (se você armazenar isso na integração)
    // this.configForm.get('endpoint')?.setValue(this.selectedIntegration.currentEndpoint || '');

    // marcar eventos ativos
    this.availableEvents.forEach((event) => {
      const isEnabled = this.selectedIntegration!.events.some(
        (e) => e.key === event.key && e.enabled
      );
      this.configForm.get(event.key)?.setValue(isEnabled);
    });

    // marcar produtos (mock – aqui você pode ligar com a integração real)
    this.products.forEach((product) => {
      // exemplo: todos marcados para webhooks, nenhum para utmify
      const checked =
        this.selectedIntegration!.id === 'webhooks' ? true : false;
      this.configForm.get('product_' + product.id)?.setValue(checked);
    });

    this.isConfigModalOpen = true;
  }

  closeConfigModal() {
    this.isConfigModalOpen = false;
  }

  toggleAllEvents(value: boolean) {
    this.availableEvents.forEach((event) => {
      this.configForm.get(event.key)?.setValue(value);
    });
  }

  submitConfig() {
    if (!this.selectedIntegration) return;

    const raw = this.configForm.getRawValue();
    const endpoint = raw.endpoint;
    const productScope = raw.productScope;

    const enabledEventKeys = this.availableEvents
      .filter((event) => raw[event.key])
      .map((event) => event.key);

    const selectedProductIds = this.products
      .filter((p) => raw['product_' + p.id])
      .map((p) => p.id);

    // Atualiza os eventos na integração (mock)
    this.selectedIntegration.events = this.availableEvents.map((def) => {
      const existing =
        this.selectedIntegration!.events.find((e) => e.key === def.key) || null;

      return {
        key: def.key,
        label: def.label,
        description: existing?.description || def.description,
        triggerLabel: existing?.triggerLabel || 'Ver regra no backend',
        enabled: enabledEventKeys.includes(def.key),
        lastSentAt: existing?.lastSentAt,
      };
    });

    this.selectedIntegration.connectedEvents =
      this.selectedIntegration.events.filter((e) => e.enabled).length;

    console.log('Salvar configuração integração:', {
      integrationId: this.selectedIntegration.id,
      endpoint,
      productScope,
      selectedProductIds,
      enabledEventKeys,
    });

    this.filterEvents();
    this.isConfigModalOpen = false;
  }
}

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '사용자',
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.listings (
  id text primary key,
  title text not null,
  district text not null,
  location text not null,
  neighborhood text,
  type text not null,
  price integer not null check (price >= 0),
  market_price integer not null check (market_price >= 0),
  recent_deal_price integer not null default 0 check (recent_deal_price >= 0),
  listing_average integer not null default 0 check (listing_average >= 0),
  score integer not null default 80 check (score between 0 and 100),
  has_video boolean not null default false,
  has_report boolean not null default false,
  area_value numeric(10, 2) not null default 0,
  area text not null,
  floor text not null,
  built_year integer not null,
  urgent_reason text not null,
  seller_type text not null,
  description text not null,
  highlights jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  transit jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  partner_broker jsonb not null default '{}'::jsonb,
  image text not null,
  created_at timestamptz not null default timezone('utc', now()),
  source text not null default 'seed',
  owner_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected'))
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  district text not null,
  type text not null,
  keyword text not null default '',
  max_price integer not null default 0,
  min_area numeric(10, 2) not null default 0,
  min_discount numeric(10, 2) not null default 5,
  has_video boolean not null default false,
  approved_only boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id text references public.listings(id) on delete set null,
  requester_type text not null,
  title text,
  district text not null,
  location text,
  type text not null,
  price integer not null default 0,
  market_price integer not null default 0,
  area_value numeric(10, 2) not null default 0,
  floor text,
  built_year integer,
  urgent_reason text not null,
  description text,
  image text,
  has_video boolean not null default false,
  has_report boolean not null default false,
  approved boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id text not null references public.listings(id) on delete cascade,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists alerts_user_created_idx on public.alerts (user_id, created_at desc);
create index if not exists submissions_user_created_idx on public.submissions (user_id, created_at desc);
create index if not exists inquiries_user_created_idx on public.inquiries (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1), '사용자'),
    new.email
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email;

  return new;
end;
$$;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email on auth.users
for each row execute procedure public.sync_profile_email();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.format_percent_ko(value_input numeric)
returns text
language sql
immutable
as $$
  select trim(to_char(coalesce(value_input, 0), 'FM999990D0')) || '%';
$$;

create or replace function public.create_partner_broker_json(district_input text)
returns jsonb
language sql
stable
as $$
  select case coalesce(district_input, '서울')
    when '서울' then jsonb_build_object(
      'name', '서울 시그널 공인중개사',
      'intro', '실수요자 급매 협상과 현장 검증을 빠르게 연결하는 파트너입니다.',
      'responseTime', '평균 13분',
      'deals', 41,
      'phone', '02-6002-1180'
    )
    when '경기' then jsonb_build_object(
      'name', '경기 패스트 공인중개사',
      'intro', '수도권 실거주 수요 매칭이 빠른 파트너입니다.',
      'responseTime', '평균 17분',
      'deals', 34,
      'phone', '031-8008-2727'
    )
    when '인천' then jsonb_build_object(
      'name', '인천 링크 공인중개사',
      'intro', '송도와 연수권 급매 매칭 경험이 풍부한 파트너입니다.',
      'responseTime', '평균 16분',
      'deals', 26,
      'phone', '032-777-1900'
    )
    else jsonb_build_object(
      'name', '서울 시그널 공인중개사',
      'intro', '실수요자 급매 협상과 현장 검증을 빠르게 연결하는 파트너입니다.',
      'responseTime', '평균 13분',
      'deals', 41,
      'phone', '02-6002-1180'
    )
  end;
$$;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.alerts enable row level security;
alter table public.submissions enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "listings_select_public_or_admin" on public.listings;
create policy "listings_select_public_or_admin"
on public.listings
for select
to anon, authenticated
using (
  status = 'approved'
  or owner_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "listings_admin_write" on public.listings;
create policy "listings_admin_write"
on public.listings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "alerts_select_own" on public.alerts;
create policy "alerts_select_own"
on public.alerts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "alerts_insert_own" on public.alerts;
create policy "alerts_insert_own"
on public.alerts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "alerts_update_own" on public.alerts;
create policy "alerts_update_own"
on public.alerts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "alerts_delete_own" on public.alerts;
create policy "alerts_delete_own"
on public.alerts
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "submissions_select_own_or_admin" on public.submissions;
create policy "submissions_select_own_or_admin"
on public.submissions
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "inquiries_select_own_or_admin" on public.inquiries;
create policy "inquiries_select_own_or_admin"
on public.inquiries
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create or replace function public.get_platform_stats()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  listings_count integer := 0;
  average_discount numeric(10, 1) := 0;
  users_count integer := 0;
  alerts_count integer := 0;
  inquiries_count integer := 0;
begin
  select
    count(*),
    coalesce(
      round(
        avg(
          case
            when market_price > 0
              then ((market_price - price)::numeric / market_price::numeric) * 100
            else 0
          end
        ),
        1
      ),
      0
    )
  into listings_count, average_discount
  from public.listings
  where status = 'approved';

  select count(*) into users_count from public.profiles;
  select count(*) into alerts_count from public.alerts;
  select count(*) into inquiries_count from public.inquiries;

  return jsonb_build_object(
    'listingsCount', listings_count,
    'averageDiscount', average_discount,
    'usersCount', users_count,
    'alertsCount', alerts_count,
    'inquiriesCount', inquiries_count
  );
end;
$$;

create or replace function public.create_submission(payload_input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  requester_type_input text := coalesce(nullif(trim(payload_input ->> 'requesterType'), ''), 'seller');
  requester_label text := case
    when requester_type_input = 'broker' then '파트너 중개사 등록'
    else '매도인 직접 등록'
  end;
  district_input text := coalesce(nullif(trim(payload_input ->> 'district'), ''), '서울');
  location_input text := nullif(trim(payload_input ->> 'location'), '');
  type_input text := coalesce(nullif(trim(payload_input ->> 'type'), ''), '아파트');
  title_input text := nullif(trim(payload_input ->> 'title'), '');
  urgent_reason_input text := coalesce(nullif(trim(payload_input ->> 'urgentReason'), ''), '양도세 일정 대응');
  description_input text := nullif(trim(payload_input ->> 'description'), '');
  image_input text := coalesce(
    nullif(trim(payload_input ->> 'image'), ''),
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80'
  );
  has_video_input boolean := coalesce(nullif(payload_input ->> 'hasVideo', '')::boolean, false);
  has_report_input boolean := coalesce(nullif(payload_input ->> 'hasReport', '')::boolean, false);
  area_value_input numeric(10, 2) := greatest(coalesce(nullif(payload_input ->> 'areaValue', '')::numeric, 0), 0);
  price_input integer := greatest(coalesce(nullif(payload_input ->> 'price', '')::integer, 0), 0);
  market_price_input integer := greatest(coalesce(nullif(payload_input ->> 'marketPrice', '')::integer, 0), 0);
  floor_input text := coalesce(nullif(trim(payload_input ->> 'floor'), ''), '층수 협의');
  built_year_input integer := greatest(
    coalesce(
      nullif(payload_input ->> 'builtYear', '')::integer,
      extract(year from timezone('utc', now()))::integer
    ),
    1900
  );
  discount_rate numeric(10, 1) := case
    when market_price_input > 0
      then round(((market_price_input - price_input)::numeric / market_price_input::numeric) * 100, 1)
    else 0
  end;
  blockers text[] := array[]::text[];
  recommendations text[] := array[]::text[];
  approved_input boolean := false;
  submission_id uuid := gen_random_uuid();
  listing_id_input text := null;
  listing_row jsonb := null;
  partner_broker_payload jsonb := public.create_partner_broker_json(district_input);
  recent_deal_price_input integer := round(market_price_input * 0.985);
  listing_average_input integer := round(market_price_input * 1.012);
  score_input integer := least(97, greatest(70, 74 + round(discount_rate * 2)::integer));
  area_label text := case
    when area_value_input > 0 then trim(to_char(area_value_input, 'FM999990D##')) || '㎡'
    else '면적 확인 필요'
  end;
  final_title text;
  final_location text;
  final_description text;
begin
  if current_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if discount_rate < 5 then
    blockers := blockers || array[
      format(
        '시세 대비 할인율이 %s로 기준 5%%에 미달합니다.',
        public.format_percent_ko(discount_rate)
      )
    ];
  end if;

  if location_input is null then
    blockers := blockers || array['동 단위 이상의 상세 위치가 비어 있어 추가 검증이 필요합니다.'];
  end if;

  recommendations := recommendations || array[
    case
      when has_video_input
        then '영상 현장 자료가 확보되어 신뢰 점수에 반영되었습니다.'
      else '영상 현장 자료를 올리면 신뢰 점수가 더 높아집니다.'
    end,
    case
      when has_report_input
        then '현장 리포트가 있어 파트너 중개사 연결 전환율이 좋아집니다.'
      else '현장 리포트를 추가하면 승인 후 전환율이 더 좋아집니다.'
    end,
    format('현재 입력 기준 급매 할인율은 %s입니다.', public.format_percent_ko(discount_rate))
  ];

  approved_input := coalesce(array_length(blockers, 1), 0) = 0;
  final_title := coalesce(
    title_input,
    concat_ws(
      ' ',
      coalesce(location_input, district_input),
      type_input,
      case when area_value_input > 0 then trim(to_char(area_value_input, 'FM999990D##')) || '㎡' end
    )
  );
  final_location := coalesce(location_input, district_input || ' 상세 주소 확인 필요');
  final_description := coalesce(
    description_input,
    '매도 등록 단계에서 입력된 기본 설명입니다. 파트너 중개사 연결 후 현장 검증과 보완 자료가 추가됩니다.'
  );

  if approved_input then
    listing_id_input := 'listing-' || replace(gen_random_uuid()::text, '-', '');

    insert into public.listings (
      id,
      title,
      district,
      location,
      neighborhood,
      type,
      price,
      market_price,
      recent_deal_price,
      listing_average,
      score,
      has_video,
      has_report,
      area_value,
      area,
      floor,
      built_year,
      urgent_reason,
      seller_type,
      description,
      highlights,
      risks,
      transit,
      tags,
      partner_broker,
      image,
      created_at,
      source,
      owner_user_id,
      status
    )
    values (
      listing_id_input,
      final_title,
      district_input,
      final_location,
      coalesce(location_input, district_input),
      type_input,
      price_input,
      market_price_input,
      recent_deal_price_input,
      listing_average_input,
      score_input,
      has_video_input,
      has_report_input,
      area_value_input,
      area_label,
      floor_input,
      built_year_input,
      urgent_reason_input,
      requester_label,
      final_description,
      jsonb_build_array(
        case when has_video_input then '영상 현장 자료 보유' else '현장 영상 추후 등록 예정' end,
        case when has_report_input then '현장 리포트 보유' else '현장 리포트 추후 등록 예정' end,
        urgent_reason_input || ' 사유로 빠른 거래 희망'
      ),
      jsonb_build_array(
        '실거래가 API 연동 시 최종 승인 값이 달라질 수 있습니다.',
        '등기, 대출, 세금 관련 검토는 계약 전 별도 확인이 필요합니다.'
      ),
      jsonb_build_array('세부 교통 정보는 현장 점검 후 보완됩니다.'),
      jsonb_build_array('신규 등록', requester_label, urgent_reason_input),
      partner_broker_payload,
      image_input,
      timezone('utc', now()),
      'user',
      current_user_id,
      'approved'
    );

    select to_jsonb(current_listing)
    into listing_row
    from (
      select *
      from public.listings
      where id = listing_id_input
    ) as current_listing;
  else
    listing_row := jsonb_build_object(
      'title', final_title,
      'district', district_input,
      'location', final_location,
      'type', type_input,
      'price', price_input,
      'marketPrice', market_price_input,
      'recentDealPrice', recent_deal_price_input,
      'listingAverage', listing_average_input,
      'score', score_input,
      'hasVideo', has_video_input,
      'hasReport', has_report_input,
      'areaValue', area_value_input,
      'area', area_label,
      'floor', floor_input,
      'builtYear', built_year_input,
      'urgentReason', urgent_reason_input,
      'sellerType', requester_label,
      'description', final_description,
      'partnerBroker', partner_broker_payload,
      'image', image_input,
      'createdAt', timezone('utc', now())
    );
  end if;

  insert into public.submissions (
    id,
    user_id,
    listing_id,
    requester_type,
    title,
    district,
    location,
    type,
    price,
    market_price,
    area_value,
    floor,
    built_year,
    urgent_reason,
    description,
    image,
    has_video,
    has_report,
    approved,
    blockers,
    recommendations,
    created_at
  )
  values (
    submission_id,
    current_user_id,
    listing_id_input,
    requester_type_input,
    final_title,
    district_input,
    final_location,
    type_input,
    price_input,
    market_price_input,
    area_value_input,
    floor_input,
    built_year_input,
    urgent_reason_input,
    final_description,
    image_input,
    has_video_input,
    has_report_input,
    approved_input,
    to_jsonb(blockers),
    to_jsonb(recommendations),
    timezone('utc', now())
  );

  return jsonb_build_object(
    'id', submission_id,
    'listingId', listing_id_input,
    'approved', approved_input,
    'blockers', to_jsonb(blockers),
    'recommendations', to_jsonb(recommendations),
    'submittedAt', timezone('utc', now()),
    'listing', listing_row
  );
end;
$$;

create or replace function public.create_inquiry(listing_id_input text, message_input text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  trimmed_message text := nullif(trim(message_input), '');
  inquiry_id uuid := gen_random_uuid();
  listing_record public.listings%rowtype;
begin
  if current_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if listing_id_input is null or trimmed_message is null then
    raise exception '매물과 문의 내용을 입력해 주세요.';
  end if;

  select *
  into listing_record
  from public.listings
  where id = listing_id_input
    and status = 'approved';

  if not found then
    raise exception '문의할 수 없는 매물입니다.';
  end if;

  insert into public.inquiries (
    id,
    user_id,
    listing_id,
    message,
    status,
    created_at
  )
  values (
    inquiry_id,
    current_user_id,
    listing_record.id,
    trimmed_message,
    'new',
    timezone('utc', now())
  );

  return jsonb_build_object(
    'id', inquiry_id,
    'listingId', listing_record.id,
    'listingTitle', listing_record.title,
    'listingLocation', listing_record.location,
    'message', trimmed_message,
    'status', 'new',
    'createdAt', timezone('utc', now())
  );
end;
$$;

create or replace function public.get_admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  return jsonb_build_object(
    'stats',
    public.get_platform_stats(),
    'submissions',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', sub.id,
            'title', coalesce(sub.title, listing.title, '등록 심사 매물'),
            'requesterType', sub.requester_type,
            'district', sub.district,
            'location', sub.location,
            'price', sub.price,
            'marketPrice', sub.market_price,
            'urgentReason', sub.urgent_reason,
            'approved', sub.approved,
            'createdAt', sub.created_at,
            'userName', profile.name,
            'userEmail', profile.email
          )
          order by sub.created_at desc
        ),
        '[]'::jsonb
      )
      from (
        select *
        from public.submissions
        order by created_at desc
        limit 20
      ) as sub
      inner join public.profiles as profile on profile.id = sub.user_id
      left join public.listings as listing on listing.id = sub.listing_id
    ),
    'inquiries',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', inquiry.id,
            'listingId', inquiry.listing_id,
            'listingTitle', listing.title,
            'message', inquiry.message,
            'status', inquiry.status,
            'createdAt', inquiry.created_at,
            'userName', profile.name,
            'userEmail', profile.email
          )
          order by inquiry.created_at desc
        ),
        '[]'::jsonb
      )
      from (
        select *
        from public.inquiries
        order by created_at desc
        limit 20
      ) as inquiry
      inner join public.profiles as profile on profile.id = inquiry.user_id
      inner join public.listings as listing on listing.id = inquiry.listing_id
    )
  );
end;
$$;

grant execute on function public.get_platform_stats() to anon, authenticated;
grant execute on function public.create_submission(jsonb) to authenticated;
grant execute on function public.create_inquiry(text, text) to authenticated;
grant execute on function public.get_admin_overview() to authenticated;

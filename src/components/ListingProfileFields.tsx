import type { ListingEditorDetails, ListingKind } from "@/types/listing";

const scoreValue = (value: number | null | undefined) => value == null ? "" : String(value);

function ScoreField({ id, name, label, value }: { id: string; name: string; label: string; value?: number | null }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input className="input" id={id} name={name} type="number" min="0" max="5" step="0.1" defaultValue={scoreValue(value)} placeholder="未评分" />
    </div>
  );
}

function ParticipationOptions() {
  return <><option value="">未确认</option><option value="yes">是</option><option value="partial">部分允许</option><option value="no">否</option></>;
}

function CompetitionFields({ item }: { item?: ListingEditorDetails | null }) {
  const profile = item?.competition_profile;
  return (
    <section className="profile-editor">
      <div><p className="eyebrow">Competition Profile</p><h2>竞赛专属字段</h2><p className="muted">资格和评分没有可靠依据时保持“未确认”或留空。</p></div>
      <div className="filter-form profile-editor__grid">
        <div className="field"><label htmlFor="competition_type">比赛类型</label><select className="select" id="competition_type" name="competition_type" defaultValue={profile?.competition_type || ""}><option value="">未确认</option><option value="build">Build / Product</option><option value="benchmark">Benchmark / Leaderboard</option><option value="hybrid">Hybrid</option><option value="ctf">CTF</option><option value="competitive-programming">Programming</option><option value="academic">Academic</option></select></div>
        <div className="field"><label htmlFor="competition_frequency">举办频率</label><select className="select" id="competition_frequency" name="competition_frequency" defaultValue={profile?.frequency || ""}><option value="">未确认</option><option value="high">高频</option><option value="medium">中等</option><option value="occasional">偶发</option></select></div>
        <div className="field"><label htmlFor="competition_chinese_friendly">中国开发者友好度</label><select className="select" id="competition_chinese_friendly" name="competition_chinese_friendly" defaultValue={profile?.chinese_friendly || ""}><option value="">未确认</option><option value="high">高</option><option value="medium">中</option><option value="low">低</option></select></div>
        <div className="field"><label htmlFor="competition_prize">奖金</label><input className="input" id="competition_prize" name="competition_prize" defaultValue={profile?.prize || ""} placeholder="仅填写官网确认内容" /></div>
        <div className="field"><label htmlFor="competition_individual_friendly">个人可参加</label><select className="select" id="competition_individual_friendly" name="competition_individual_friendly" defaultValue={profile?.individual_friendly || ""}><ParticipationOptions /></select></div>
        <div className="field"><label htmlFor="competition_working_professional_allowed">在职可参加</label><select className="select" id="competition_working_professional_allowed" name="competition_working_professional_allowed" defaultValue={profile?.working_professional_allowed || ""}><ParticipationOptions /></select></div>
        <div className="field"><label htmlFor="competition_student_only">学生限定</label><select className="select" id="competition_student_only" name="competition_student_only" defaultValue={profile?.student_only || ""}><ParticipationOptions /></select></div>
        <div className="field"><label htmlFor="competition_international_allowed">国际参赛</label><select className="select" id="competition_international_allowed" name="competition_international_allowed" defaultValue={profile?.international_allowed || ""}><ParticipationOptions /></select></div>
        <div className="field profile-editor__wide"><label htmlFor="competition_restrictions">限制条件（逗号分隔）</label><input className="input" id="competition_restrictions" name="competition_restrictions" defaultValue={profile?.restrictions.join("，") || ""} /></div>
        <div className="field profile-editor__wide"><label htmlFor="competition_examples">案例或公开作品（逗号分隔）</label><input className="input" id="competition_examples" name="competition_examples" defaultValue={profile?.examples.join("，") || ""} /></div>
      </div>
      <div className="filter-form profile-editor__scores">
        <ScoreField id="profile_agent_score" name="profile_agent_score" label="Agent" value={profile?.agent_score} />
        <ScoreField id="profile_ai_application_score" name="profile_ai_application_score" label="AI Application" value={profile?.ai_application_score} />
        <ScoreField id="profile_algorithm_score" name="profile_algorithm_score" label="Algorithm" value={profile?.algorithm_score} />
        <ScoreField id="profile_security_score" name="profile_security_score" label="Security" value={profile?.security_score} />
        <ScoreField id="competition_direction_match_score" name="competition_direction_match_score" label="CCN 方向匹配" value={profile?.direction_match_score} />
        <ScoreField id="competition_resume_value" name="competition_resume_value" label="简历价值" value={profile?.resume_value} />
        <ScoreField id="competition_portfolio_value" name="competition_portfolio_value" label="作品集价值" value={profile?.portfolio_value} />
        <ScoreField id="competition_reuse_value" name="competition_reuse_value" label="项目复用" value={profile?.reuse_value} />
        <ScoreField id="competition_difficulty" name="competition_difficulty" label="参与难度" value={profile?.difficulty} />
        <ScoreField id="competition_winning_difficulty" name="competition_winning_difficulty" label="获奖难度" value={profile?.winning_difficulty} />
        <ScoreField id="competition_participation_cost" name="competition_participation_cost" label="参与成本" value={profile?.participation_cost} />
        <ScoreField id="competition_activity_score" name="competition_activity_score" label="当前活跃度" value={profile?.activity_score} />
      </div>
      <ScoreControls scoreStatus={profile?.score_status} hiddenGem={profile?.hidden_gem} />
    </section>
  );
}

function CertificationFields({ item }: { item?: ListingEditorDetails | null }) {
  const profile = item?.certification_profile;
  return (
    <section className="profile-editor">
      <div><p className="eyebrow">Certification Profile</p><h2>认证专属字段</h2><p className="muted">证书类型、状态和考试信息必须来自认证方官方资料。</p></div>
      <div className="filter-form profile-editor__grid">
        <div className="field"><label htmlFor="certification_category">分类</label><input className="input" id="certification_category" name="certification_category" defaultValue={profile?.category || ""} /></div>
        <div className="field"><label htmlFor="certification_type">认证类型</label><select className="select" id="certification_type" name="certification_type" defaultValue={profile?.certification_type || ""}><option value="">未确认</option><option value="professional-certification">职业认证考试</option><option value="hands-on">Hands-on 实操认证</option><option value="micro-credential">Micro Credential</option><option value="badge">Digital Badge</option><option value="course-certificate">课程结业证书</option><option value="training-certificate">培训证书</option></select></div>
        <div className="field"><label htmlFor="certification_level">等级</label><select className="select" id="certification_level" name="certification_level" defaultValue={profile?.certification_level || ""}><option value="">未确认</option><option value="entry">Entry</option><option value="associate">Associate</option><option value="professional">Professional</option><option value="expert">Expert</option></select></div>
        <div className="field"><label htmlFor="certification_experience_level">经验要求</label><select className="select" id="certification_experience_level" name="certification_experience_level" defaultValue={profile?.experience_level || ""}><option value="">未确认</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
        <div className="field"><label htmlFor="certification_current_status">当前状态</label><select className="select" id="certification_current_status" name="certification_current_status" defaultValue={profile?.current_status || "unknown"}><option value="unknown">未确认</option><option value="active">Active</option><option value="retiring">Retiring</option><option value="retired">Retired</option></select></div>
        <div className="field"><label htmlFor="certification_chinese_exam_available">中文考试</label><select className="select" id="certification_chinese_exam_available" name="certification_chinese_exam_available" defaultValue={profile?.chinese_exam_available || ""}><ParticipationOptions /></select></div>
        <div className="field"><label htmlFor="certification_exam_format">考试形式</label><input className="input" id="certification_exam_format" name="certification_exam_format" defaultValue={profile?.exam_format || ""} /></div>
        <div className="field"><label htmlFor="certification_price">价格</label><input className="input" id="certification_price" name="certification_price" defaultValue={profile?.price || ""} /></div>
        <div className="field"><label htmlFor="certification_validity">有效期</label><input className="input" id="certification_validity" name="certification_validity" defaultValue={profile?.validity || ""} /></div>
        <div className="field"><label htmlFor="certification_renewal">续证</label><input className="input" id="certification_renewal" name="certification_renewal" defaultValue={profile?.renewal || ""} /></div>
        <div className="field profile-editor__wide"><label htmlFor="certification_prerequisites">先修条件</label><textarea className="textarea" id="certification_prerequisites" name="certification_prerequisites" defaultValue={profile?.prerequisites || ""} /></div>
        <div className="field profile-editor__wide"><label htmlFor="certification_notes">备注（逗号分隔）</label><input className="input" id="certification_notes" name="certification_notes" defaultValue={profile?.notes.join("，") || ""} /></div>
      </div>
      <div className="filter-form profile-editor__scores">
        <ScoreField id="certification_global_recognition" name="certification_global_recognition" label="全球认可" value={profile?.global_recognition} />
        <ScoreField id="certification_china_recognition" name="certification_china_recognition" label="中国认可" value={profile?.china_recognition} />
        <ScoreField id="certification_technical_depth" name="certification_technical_depth" label="技术深度" value={profile?.technical_depth} />
        <ScoreField id="certification_hands_on_score" name="certification_hands_on_score" label="Hands-on" value={profile?.hands_on_score} />
        <ScoreField id="certification_ai_agent_score" name="certification_ai_agent_score" label="AI Agent" value={profile?.ai_agent_score} />
        <ScoreField id="certification_resume_value" name="certification_resume_value" label="简历价值" value={profile?.resume_value} />
        <ScoreField id="certification_learning_value" name="certification_learning_value" label="学习价值" value={profile?.learning_value} />
        <ScoreField id="certification_ecosystem_value" name="certification_ecosystem_value" label="生态价值" value={profile?.ecosystem_value} />
        <ScoreField id="certification_recruiting_value" name="certification_recruiting_value" label="招聘认可" value={profile?.recruiting_value} />
        <ScoreField id="certification_role_match_score" name="certification_role_match_score" label="岗位匹配" value={profile?.role_match_score} />
        <ScoreField id="certification_scarcity_score" name="certification_scarcity_score" label="稀缺度" value={profile?.scarcity_score} />
        <ScoreField id="certification_fee_roi_score" name="certification_fee_roi_score" label="费用 ROI" value={profile?.fee_roi_score} />
        <ScoreField id="certification_time_roi_score" name="certification_time_roi_score" label="时间 ROI" value={profile?.time_roi_score} />
        <ScoreField id="certification_difficulty" name="certification_difficulty" label="考试难度" value={profile?.difficulty} />
        <ScoreField id="certification_preparation_cost" name="certification_preparation_cost" label="准备成本" value={profile?.preparation_cost} />
      </div>
      <ScoreControls scoreStatus={profile?.score_status} />
    </section>
  );
}

function ScoreControls({ scoreStatus, hiddenGem = false }: { scoreStatus?: string; hiddenGem?: boolean }) {
  return (
    <div className="profile-editor__controls">
      <div className="field"><label htmlFor="profile_score_status">评分状态</label><select className="select" id="profile_score_status" name="profile_score_status" defaultValue={scoreStatus || "unrated"}><option value="unrated">未评分</option><option value="draft">评分草稿</option><option value="published">公开评分</option></select></div>
      <label><input name="profile_hidden_gem" type="checkbox" defaultChecked={hiddenGem} /> Hidden Gem</label>
    </div>
  );
}

function PlatformFields({ item }: { item?: ListingEditorDetails | null }) {
  const profile = item?.platform_profile;
  return (
    <section className="profile-editor">
      <div><p className="eyebrow">Platform Profile</p><h2>平台专属字段</h2><p className="muted">平台不计算 CCN 总分，只保存方向、活跃度和编辑推荐等级。</p></div>
      <div className="filter-form profile-editor__grid">
        <div className="field profile-editor__wide"><label htmlFor="platform_types">平台类型（逗号分隔）</label><input className="input" id="platform_types" name="platform_types" defaultValue={profile?.platform_types.join("，") || ""} /></div>
        <div className="field"><label htmlFor="platform_individual_friendly">个人友好</label><select className="select" id="platform_individual_friendly" name="platform_individual_friendly" defaultValue={profile?.individual_friendly || ""}><ParticipationOptions /></select></div>
        <div className="field"><label htmlFor="platform_working_professional_friendly">在职友好</label><select className="select" id="platform_working_professional_friendly" name="platform_working_professional_friendly" defaultValue={profile?.working_professional_friendly || ""}><ParticipationOptions /></select></div>
        <div className="field"><label htmlFor="platform_check_frequency">检查频率</label><select className="select" id="platform_check_frequency" name="platform_check_frequency" defaultValue={profile?.check_frequency || "weekly"}><option value="weekly">每周</option><option value="biweekly">每两周</option><option value="monthly">每月</option></select></div>
        <div className="field"><label htmlFor="platform_recommendation_level">推荐等级</label><select className="select" id="platform_recommendation_level" name="platform_recommendation_level" defaultValue={profile?.recommendation_level || ""}><option value="">未评级</option><option value="S">S</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></div>
      </div>
      <div className="filter-form profile-editor__scores">
        <ScoreField id="profile_agent_score" name="profile_agent_score" label="Agent" value={profile?.agent_score} />
        <ScoreField id="profile_ai_application_score" name="profile_ai_application_score" label="AI Application" value={profile?.ai_application_score} />
        <ScoreField id="profile_algorithm_score" name="profile_algorithm_score" label="Algorithm" value={profile?.algorithm_score} />
        <ScoreField id="profile_security_score" name="profile_security_score" label="Security" value={profile?.security_score} />
        <ScoreField id="platform_activity_score" name="platform_activity_score" label="当前活跃度" value={profile?.activity_score} />
      </div>
      <div className="profile-editor__controls"><label><input name="profile_hidden_gem" type="checkbox" defaultChecked={profile?.hidden_gem} /> Hidden Gem</label></div>
    </section>
  );
}

export function ListingProfileFields({ kind, item }: { kind: ListingKind; item?: ListingEditorDetails | null }) {
  if (kind === "competition") return <CompetitionFields item={item} />;
  if (kind === "certification") return <CertificationFields item={item} />;
  return <PlatformFields item={item} />;
}
